import { App as AntApp, Layout, Menu } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ColorGridMinigame } from "./components/color-grid";

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
    element: <div>{"rotation lock"}</div>,
  },
]);

function App() {
  const selectedMenuItem =
    window.location.pathname.slice(1) !== ""
      ? window.location.pathname.slice(1)
      : "color-grid";
  return (
    <AntApp style={{ width: "100%", height: "100%" }}>
      <Layout style={{ width: "100%", height: "100%" }}>
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div className="demo-logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            // defaultSelectedKeys={["color-grid"]}
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
        <Footer style={{ textAlign: "center" }}>Source: github</Footer>
      </Layout>
    </AntApp>
  );
}

export default App;
