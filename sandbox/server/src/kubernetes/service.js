import { k8sCoreV1Api } from './config.js';

export async function createService(sandboxId) {
    try {
        const serviceManifest = {
            metadata: {
                name: `sandbox-service-${sandboxId}`,
                labels: {
                    app: "sandbox",
                    sandboxId: sandboxId,
                },
            },
            spec: {
                selector: {
                    app: "sandbox",
                    sandboxId: sandboxId,
                },
                ports: [
                    {
                        protocol: "TCP",
                        name: "http",
                        port: 80,
                        targetPort: 5173,
                    },
                ],
                type: "ClusterIP",
            },
        };

        const response = await k8sCoreV1Api.createNamespacedService({
            namespace: "default",
            body: serviceManifest,
        });

        console.log("Service created:", response.body.metadata.name);

        return response;
    } catch (error) {
        return console.error("Error creating service:", error);
        throw error;
    }
}