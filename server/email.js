import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

const graphClient = Client.init({
  authProvider: async (done) => {
    try {
      const token = await credential.getToken(
        "https://graph.microsoft.com/.default"
      );

      done(null, token.token);
    } catch (err) {
      done(err, null);
    }
  }
});

export async function sendEmail({ to, subject, text, html }) {
  await graphClient.api("/users/noreply@svbvd010.nl/sendMail").post({
    message: {
      subject,
      body: {
        contentType: html ? "HTML" : "Text",
        content: html || text || ""
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    },
    saveToSentItems: true
  });

  return { success: true };
}