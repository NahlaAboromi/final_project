require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Translation = require('./models/Translation');
const { translateBatch } = require('./services/deepl.service');

function makeKey({ sourceLang, targetLang, text }) {
  return crypto
    .createHash('sha256')
    .update(`${sourceLang}::${targetLang}::${text}`, 'utf8')
    .digest('hex');
}

async function run() {
  const sourceLang = 'EN';
  const targetLang = 'HE';
  const texts = ['Hello everyone', 'How are you?'];

  try {
    console.log('1) Connecting to Mongo...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Mongo connected');

    console.log('2) Checking Translation model access...');
    const count = await Translation.countDocuments();
    console.log('✅ Translation model works. Current docs:', count);

    const original = texts.map((t, i) => ({
      i,
      t,
      key: makeKey({ sourceLang, targetLang, text: t }),
    }));

    const keys = original.map(o => o.key);

    console.log('3) Reading cache from Mongo...');
    const cached = await Translation.find({ key: { $in: keys } }).lean();
    console.log('✅ Cache read ok. Found cached items:', cached.length);

    const cacheMap = new Map(cached.map(c => [c.key, c.translatedText]));
    const missing = original.filter(o => !cacheMap.has(o.key));

    console.log('4) Missing items:', missing.length);

    if (missing.length > 0) {
      console.log('5) Calling DeepL...');
      const translated = await translateBatch({
        texts: missing.map(m => m.t),
        sourceLang,
        targetLang,
      });
      console.log('✅ DeepL returned:', translated);

      console.log('6) Writing translations to Mongo...');
      const newlyTranslated = await Promise.all(
        missing.map((m, idx) => {
          const doc = {
            key: m.key,
            sourceLang,
            targetLang,
            text: m.t,
            translatedText: translated[idx],
            updatedAt: new Date(),
          };

          return Translation.findOneAndUpdate(
            { key: m.key },
            doc,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        })
      );

      console.log('✅ Mongo write ok. Saved items:', newlyTranslated.length);
      newlyTranslated.forEach(nt => cacheMap.set(nt.key, nt.translatedText));
    }

    const translations = original.map(o => cacheMap.get(o.key) || o.t);
    console.log('7) Final translations:', translations);

    console.log('🎉 Full translate flow works');
  } catch (err) {
    console.error('❌ TEST FAILED');

    if (err.response) {
      console.error('HTTP Status:', err.response.status);
      console.error('HTTP Data:', err.response.data);
    }

    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Mongo closed');
  }
}

run();