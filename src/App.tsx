import "../src/styles/global.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import {
    Agreement,
    CreateAccount,
    Detail,
    List,
    Login,
    Members,
    Modify,
    Privacy,
    Profile,
    Setting,
} from "./pages";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import IconLoading from "./assets/IconLoading";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 20, // 20분
        },
    },
});

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        errorElement: <>Not Found😅</>,
        children: [
            {
                path: "/",
                element: <Members />,
                children: [
                    {
                        path: "",
                        element: <List />,
                    },
                    {
                        path: "members/:id",
                        element: <Detail />,
                    },
                    {
                        path: "members/modify",
                        element: <Modify />,
                    },
                    {
                        path: "members/modify/:id",
                        element: <Modify />,
                    },
                ],
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/setting",
                element: <Setting />,
            },
        ],
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/createAccount",
        element: <CreateAccount />,
    },
    {
        path: "/privacy",
        element: <Privacy />,
    },
    {
        path: "/agreement",
        element: <Agreement />,
    },
]);

function App() {
    const [loading, setLoading] = useState(true);
    const init = async () => {
        await auth.authStateReady();
        setLoading(false);
    };
    useEffect(() => {
        init();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            {/* {loading ? "loading..." : <RouterProvider router={router} />} */}
            {loading ? (
                <div className="loading">
                    <IconLoading width="2rem" color="#333" />
                </div>
            ) : (
                <RouterProvider router={router} />
            )}
        </QueryClientProvider>
    );
}

export default App;
