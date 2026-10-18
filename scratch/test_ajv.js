const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemas = [
  'verticals.schema.json',
  'sources.schema.json',
  'service-registry.schema.json',
  'pricing.schema.json',
  'eligibility.schema.json',
  'jurisdiction-variations.schema.json',
  'regulatory-claims.schema.json'
];

for (const s of schemas) {
  const schemaPath = path.join(__dirname, '..', 'data', 'schemas', s);
  const schemaObj = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const dataPath = path.join(__dirname, '..', 'data', s.replace('.schema', ''));
  const dataObj = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  try {
    const validate = ajv.compile(schemaObj);
    const valid = validate(dataObj);
    console.log(`${s}: compiled successfully. Valid? ${valid}. Errors:`, validate.errors);
  } catch (err) {
    console.error(`ERROR compiling ${s}:`, err.message);
  }
}
