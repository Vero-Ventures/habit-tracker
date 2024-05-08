let url = "";

let expoClientId =
  "430719148489-6mp24nknv8biblbgs5hok6qdq8e5rr3m.apps.googleusercontent.com";
let androidClientId =
  "430719148489-6mp24nknv8biblbgs5hok6qdq8e5rr3m.apps.googleusercontent.com";
let iosClientId =
  "430719148489-melq8bpgaobfgagjpn9tp5krmvevb87f.apps.googleusercontent.com";

if (__DEV__) {
  url = "https://api.dev-livetimeless.com";
} else {
  url = "https://api.dev-livetimeless.com";
}

export const Constants = {
  url: url,
  baseUrl: url + "/api",
  expoClientId,
  iosClientId,
  androidClientId,
};
