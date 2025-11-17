import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || "2m",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
};

const baseUrl = __ENV.API_BASE_URL || "http://localhost:5177/api/health";

export default function smokeTest() {
  const response = http.get(baseUrl);

  check(response, {
    "status is 2xx/3xx": (res) => res.status >= 200 && res.status < 400,
  });

  sleep(Number(__ENV.SLEEP || 1));
}
