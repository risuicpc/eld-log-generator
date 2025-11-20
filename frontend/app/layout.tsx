import { Outlet, useNavigation } from "react-router";
import LoadingSpinner from "./components/LoadingSpinner";

export default function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>ELD Log Generator</h1>
          <p>FMCSA Hours of Service Compliance Tool</p>
        </div>
      </header>

      <main className="container">
        {isLoading && <LoadingSpinner />}
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            &copy; 2024 ELD Log Generator. Based on FMCSA Hours of Service
            Regulations 49 CFR Part 395.
          </p>
        </div>
      </footer>
    </div>
  );
}
