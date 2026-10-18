const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://example.com/test.json",
  type: "string"
};

try {
  ajv.compile(schema);
  console.log("First compilation succeeded");
  ajv.compile(schema);
  console.log("Second compilation succeeded");
} catch (e) {
  console.error("Second compilation error:", e.message);
}
