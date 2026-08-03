import Link from "next/link";
import { CREWorkspace } from "../components/CREWorkspace";

export default function WorkspacePage() {
  return (
    <div className="workspace-page">
      <div className="workspace-banner">
        <Link href="/" className="banner-link">
          ← Back to Landmark AI homepage
        </Link>
      </div>
      <CREWorkspace />
    </div>
  );
}
