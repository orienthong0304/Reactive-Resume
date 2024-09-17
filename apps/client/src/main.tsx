import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = ReactDOM.createRoot(document.querySelector("#root")!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
