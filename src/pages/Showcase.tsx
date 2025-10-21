/**
 * Página de Showcase do OraclusX Design System
 */

import LibraryShowcase from"@/components/oraclusx-ds/LibraryShowcase";
import { useDocumentTitle } from"@/hooks";

export default function ShowcasePage() {
  useDocumentTitle("Design System");

  return <LibraryShowcase />;
}
