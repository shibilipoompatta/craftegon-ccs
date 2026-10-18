const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const SCHEMAS_DIR = path.join(__dirname, '..', 'data', 'schemas');
const schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema.json'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

console.log(`Auditing ${schemaFiles.length} schemas in ${SCHEMAS_DIR}:`);

for (const f of schemaFiles) {
  const schemaContent = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, f), 'utf8'));
  console.log(`\n--- ${f} ---`);
  console.log(`$schema: ${schemaContent.$schema}`);
  console.log(`$id: ${schemaContent.$id}`);
  console.log(`type: ${schemaContent.type}`);
  console.log(`additionalProperties: ${schemaContent.items ? schemaContent.items.additionalProperties : schemaContent.additionalProperties}`);
  console.log(`required fields: ${schemaContent.items ? schemaContent.items.required.join(', ') : schemaContent.required}`);

  try {
    const validate = ajv.compile(schemaContent);
    console.log(`Ajv2020 compile: SUCCESS`);
  } catch (err) {
    console.error(`Ajv2020 compile ERROR:`, err.message);
  }
}
