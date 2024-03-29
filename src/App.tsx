import { App as AntApp, Layout, Menu } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ColorGridMinigame from "./components/color-grid";
import RotationLock from "./components/rotation-lock";
import QuickType from "./components/quick-type";

const { Content, Footer, Header } = Layout;

const menuItems = [
  {
    key: "color-grid",
    label: <a href="/color-grid">Color Grid</a>,
    selectable: true,
  },
  {
    key: "rotation-lock",
    label: <a href="/rotation-lock">Rotation Lock</a>,
    selectable: true,
  },
  {
    key: "quick-type",
    label: <a href="/quick-type">Quick Type</a>,
    selectable: true,
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <ColorGridMinigame />,
  },
  {
    path: "/color-grid",
    element: <ColorGridMinigame />,
  },
  {
    path: "/rotation-lock",
    element: <RotationLock />,
  },
  {
    path: "/quick-type",
    element: <QuickType />,
  },
]);

function App() {
  const selectedMenuItem =
    window.location.pathname.slice(1) !== ""
      ? window.location.pathname.slice(1)
      : "color-grid";
  return (
    <AntApp style={{ width: "100%", height: "100%" }}>
      <Layout
        style={{ width: "100%", height: "100%", backgroundColor: "#061221" }}
      >
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="demo-logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            style={{ flex: 1, minWidth: 0 }}
            selectedKeys={[selectedMenuItem]}
          />
        </Header>
        <Content
          style={{
            padding: "0 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RouterProvider router={router} />
        </Content>
        <Footer
          style={{
            textAlign: "center",
            backgroundColor: "#061221",
            color: "#FFF",
          }}
        >
          Source: github
        </Footer>
      </Layout>
    </AntApp>
  );
}

export default App;
