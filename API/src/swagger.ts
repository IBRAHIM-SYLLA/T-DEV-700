import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TimeManager API",
            version: "1.0.0",
            description: "API de gestion des pointages",
        },
        servers: [
            {
                url: "http://localhost:5001",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"], // 👈 IMPORTANT
});

export default swaggerSpec;