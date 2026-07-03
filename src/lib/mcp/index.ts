import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCoursesTool from "./tools/list-courses";
import getMyProgressTool from "./tools/get-my-progress";
import listMyCertificatesTool from "./tools/list-my-certificates";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "expert-egestor-mcp",
  title: "Expert eGestor MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Expert eGestor learning platform. Use `list_courses` to browse available courses, `get_my_progress` to see the signed-in user's progress, and `list_my_certificates` for issued certificates.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCoursesTool, getMyProgressTool, listMyCertificatesTool],
});
