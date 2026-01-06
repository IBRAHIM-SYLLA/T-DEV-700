import YAML from "yamljs";
import path from "path";

const swaggerDocs = YAML.load(
    path.join(__dirname, "swagger/api-docs.swagger.yaml")
);

export default swaggerDocs;
