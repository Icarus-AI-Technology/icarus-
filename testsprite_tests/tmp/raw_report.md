
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** icarus-make
- **Date:** 2025-11-18
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** User Login and RBAC Authorization
- **Test Code:** [TC001_User_Login_and_RBAC_Authorization.py](./TC001_User_Login_and_RBAC_Authorization.py)
- **Test Error:** The login page is currently blocked by a syntax error in the source code (index.ts) which prevents the page from rendering and disables all interactive elements. Because of this, it is impossible to proceed with the login and RBAC testing steps. Please fix the syntax error in the code to restore the UI functionality and then retry the test. Task stopped due to this blocking issue.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4E200DC1B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4E200DC1B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C0F10ADC1B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0443C0FDC1B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/lib/utils.ts?t=1763438714261:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/hooks/useGPTResearcher.ts?t=1763438713481:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/hooks/useCadastrosKPIs.ts?t=1763438718672:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/74f27f48-99bc-4d51-addb-e5deec03b7a3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Main Dashboard KPI Display and Real-Time Updates
- **Test Code:** [TC002_Main_Dashboard_KPI_Display_and_Real_Time_Updates.py](./TC002_Main_Dashboard_KPI_Display_and_Real_Time_Updates.py)
- **Test Error:** The application page at http://localhost:3001/login is currently blocked by a syntax error in the source code (in oraclusx-ds/index.ts) which prevents the login form from rendering. This stops any further testing of the dashboard KPIs and quick action buttons. Please fix the syntax error in the code to proceed.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040460634000000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A098460634000000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A058F30834000000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080331034000000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/pages/cadastros/CadastroTransportadoras.tsx?t=1763438716060:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/pages/cadastros/CadastroEquipesMedicas.tsx?t=1763438716061:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/oraclusx-ds/SearchContainer.tsx?t=1763438714261:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/08c48d90-fcf7-4c05-8e97-ea07bbc75e6e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Consignacao Avancada Module - Tab Navigation and Alerts
- **Test Code:** [TC003_Consignacao_Avancada_Module___Tab_Navigation_and_Alerts.py](./TC003_Consignacao_Avancada_Module___Tab_Navigation_and_Alerts.py)
- **Test Error:** The login page is currently broken due to a syntax error in the frontend code (index.ts file). This prevents any interaction or navigation to the Consignacao Avancada module. Testing cannot proceed until this error is resolved. Please fix the code and redeploy the application to continue testing.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C43A007C0C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080870A7C0C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438511321:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080AA097C0C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A06C040F7C0C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/services/CadastrosService.ts?t=1763438718672:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/oraclusx-ds/SearchContainer.tsx?t=1763438714261:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/hooks/useGPTResearcher.ts?t=1763438713481:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/51065258-e7a3-42ed-a3fa-54448ab8c5fc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Consignacao Avancada Module - CRUD Operations
- **Test Code:** [TC004_Consignacao_Avancada_Module___CRUD_Operations.py](./TC004_Consignacao_Avancada_Module___CRUD_Operations.py)
- **Test Error:** Testing cannot proceed because the login page fails to load due to a syntax error in the source code. The error is in /src/components/oraclusx-ds/index.ts at line 121. Please fix this error to enable UI rendering and continue testing CRUD operations for consignment records.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A08055043C280000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000BA083C280000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438503848:115:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438503848:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438504394:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438534626:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0EC150B3C280000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0983A003C280000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/hooks/useCirurgias.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/hooks/useDocumentTitle.ts?t=1763438713478:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/ea7bf1b9-3c6f-487e-a827-e7a538987d53
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Compliance & Auditoria Module - KPI Accuracy and Abbott Scoring
- **Test Code:** [TC005_Compliance__Auditoria_Module___KPI_Accuracy_and_Abbott_Scoring.py](./TC005_Compliance__Auditoria_Module___KPI_Accuracy_and_Abbott_Scoring.py)
- **Test Error:** The application is currently blocked by a syntax error in the React TypeScript code (oraclusx-ds/index.ts) which prevents the login page and subsequent modules from rendering. Because of this, I cannot access the Compliance & Auditoria module to verify the 12 KPIs or test Abbott scoring and AI agent integration. The syntax error must be fixed by the development team before testing can continue.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4D800E43B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040B809E43B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0D8B50FE43B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0D8B50FE43B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438747327:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/949fc304-0ed2-4d4e-b6bc-c4a21f923520
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Compliance & Auditoria Module - CAPA Lifecycle Management
- **Test Code:** [TC006_Compliance__Auditoria_Module___CAPA_Lifecycle_Management.py](./TC006_Compliance__Auditoria_Module___CAPA_Lifecycle_Management.py)
- **Test Error:** Testing cannot proceed because the login page is blocked by a React syntax error overlay. The error must be fixed in the codebase before further testing of CAPA lifecycle workflows can continue.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040D305041F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080CF09041F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A044F40F041F0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/lib/utils.ts?t=1763438714261:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/pages/cadastros/CadastroEquipesMedicas.tsx?t=1763438716061:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/oraclusx-ds/SearchContainer.tsx?t=1763438714261:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3001/src/hooks/useCadastrosKPIs.ts?t=1763438718672:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3001/src/lib/services/TabelasPrecosService.ts?t=1763438714270:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3001/src/hooks/useGPTResearcher.ts?t=1763438713481:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/7baf22e8-844b-4d67-832d-fdcc53c6db79
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Stock Intelligence CRUD and Alerts
- **Test Code:** [TC007_Stock_Intelligence_CRUD_and_Alerts.py](./TC007_Stock_Intelligence_CRUD_and_Alerts.py)
- **Test Error:** The application is currently blocked by a syntax error in the React component code at /src/components/oraclux-ds/index.ts line 121. This error prevents the UI from rendering, so no login or further navigation is possible. The immediate next step is to fix this code error and restart the application to restore the UI. Once fixed, the CRUD operations and alert generation tests can proceed as planned.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C090055C160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A00075095C160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:3001/node_modules/.vite/deps/@supabase_supabase-js.js?v=bc2ef006:8225:14)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438511321:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ECCB0B5C160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438530978:115:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438530978:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438525316:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A02CD8005C160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/oraclusx-ds/Card.tsx?t=1763438714261:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/oraclusx-ds/Button.tsx?t=1763438714261:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/2fdc1ffc-5efb-410d-a64e-2b67d9c1a524
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Stock Intelligence AI Forecasting and Reorder Points
- **Test Code:** [TC008_Stock_Intelligence_AI_Forecasting_and_Reorder_Points.py](./TC008_Stock_Intelligence_AI_Forecasting_and_Reorder_Points.py)
- **Test Error:** The application is currently broken due to a syntax error in the React component code (index.ts). This prevents any further testing of AI-driven demand forecasting, reorder point calculations, ABC/XYZ classification, and anomaly detection. Please fix the code error and reload the application to continue testing.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C0D800940C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx:115:22)
    at AppShell (http://localhost:3001/src/App.tsx:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438479183:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438503848:115:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438503848:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438504394:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:3001/node_modules/.vite/deps/@supabase_supabase-js.js?v=bc2ef006:8225:14)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438511321:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040C50B940C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438529770:115:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438529770:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438525316:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACF50F940C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACF50F940C0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/9a8f715d-d825-429a-b6fb-060df84db754
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Neuromorphic OraclusX Design System Component Validation
- **Test Code:** [TC009_Neuromorphic_OraclusX_Design_System_Component_Validation.py](./TC009_Neuromorphic_OraclusX_Design_System_Component_Validation.py)
- **Test Error:** The platform is currently blocked by a syntax error in the OraclusX Design System source code at 'src/components/oraclusx-ds/index.ts' line 121. This error prevents the UI from rendering, including the login form and all 28 custom neuromorphic UI components. Because of this, no testing for accessibility, light/dark mode support, or responsiveness can be performed. The next step is to fix the syntax error in the source code to enable the platform to load correctly and allow the testing of all components as required.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000D8006C240000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000380A6C240000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:3001/node_modules/.vite/deps/@supabase_supabase-js.js?v=bc2ef006:8225:14)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040670B6C240000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438534626:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080A20C6C240000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A084DB0F6C240000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/a6e6c082-a6de-47ad-8f08-9bf0423c9781
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Accessibility Compliance Across Modules (WCAG 2.1 AA)
- **Test Code:** [TC010_Accessibility_Compliance_Across_Modules_WCAG_2.1_AA.py](./TC010_Accessibility_Compliance_Across_Modules_WCAG_2.1_AA.py)
- **Test Error:** Accessibility testing cannot proceed because the application is not rendering due to a syntax error in the source code. The error must be fixed to continue testing WCAG 2.1 AA compliance on all modules.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C0DA0094130000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000D60994130000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438563734:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A058070D94130000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0D8AD1094130000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/charts/OrxLineChart.tsx?t=1763438709175:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/components/oraclusx-ds/Button.tsx?t=1763438714261:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/65b76fdb-b3b8-4ac7-bd45-2d5b0547722b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Performance and Build Validation
- **Test Code:** [TC011_Performance_and_Build_Validation.py](./TC011_Performance_and_Build_Validation.py)
- **Test Error:** The platform build failed due to a syntax error in the source code at oraclusx-ds/index.ts line 121. This prevented the platform from loading and no further testing of build time, bundle size, or runtime performance is possible. Please fix the syntax error and rebuild the platform before retrying the tests.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000D800D4290000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000D309D4290000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438503848:115:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438503848:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438504394:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438534626:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0183D0BD4290000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040BC0FD4290000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 504 (Outdated Request) (at http://localhost:3001/src/hooks/index.ts?t=1763438714943:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/15c9627b-6b44-46e9-9703-5c427a90479c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Supabase Real-Time Data Synchronization
- **Test Code:** [TC012_Supabase_Real_Time_Data_Synchronization.py](./TC012_Supabase_Real_Time_Data_Synchronization.py)
- **Test Error:** Testing cannot proceed due to a blocking syntax error in the application code preventing page rendering and login. Please fix the syntax error in /src/components/oraclusx-ds/index.ts line 119 to enable further testing of real-time data synchronization.
Browser Console Logs:
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C06A05CC160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438489066:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A040390ACC160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438503848:115:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438503848:138:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438504394:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:3001/node_modules/.vite/deps/@supabase_supabase-js.js?v=bc2ef006:8225:14)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438624471:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C43C0FCC160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[ERROR] The above error occurred in the <NavigationTracker> component:

    at NavigationTracker (http://localhost:3001/src/App.tsx?t=1763438640379:304:22)
    at AppShell (http://localhost:3001/src/App.tsx?t=1763438640379:327:53)
    at Router (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4501:15)
    at BrowserRouter (http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:5247:5)
    at App
    at AuthProvider (http://localhost:3001/src/contexts/AuthContext.tsx?t=1763438635971:28:32)
    at ErrorBoundary (http://localhost:3001/node_modules/.vite/deps/@sentry_react.js?v=fffe788c:28019:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3001/node_modules/.vite/deps/chunk-YDDRBQTN.js?v=318e839f:14031:30)
[WARNING] [Sentry] DSN não configurado. Monitoring desabilitado. (at http://localhost:3001/src/lib/sentry.ts?t=1763438653325:16:16)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0182911CC160000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:3001/login:0:0)
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3001/node_modules/.vite/deps/react-router-dom.js?v=f3fac972:4392:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438700558:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts?t=1763438714267:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/src/components/oraclusx-ds/index.ts:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/924dda96-6ab9-48bf-b581-4a4ccfed239d/281ed7a8-d720-4649-b36e-0a43a51f4af6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---