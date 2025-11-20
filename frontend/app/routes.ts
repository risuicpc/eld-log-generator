import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // Trip routes
  route("trips/calculate", "routes/trips.calculate.tsx"),
  route("trips/:id", "routes/trips.$id.tsx", [
    route("logs", "routes/trips.$id.logs.tsx"),
  ]),
] satisfies RouteConfig;
