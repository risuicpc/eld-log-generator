import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // Trip routes
  route("trips/:id", "routes/trips.calculate.tsx"),
] satisfies RouteConfig;
