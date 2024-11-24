export const decodeJWT = (token) => {
  const base64Url = token.split(".")[1]; // Get the middle part of the JWT token
  const base64 = base64Url.replace("-", "+").replace("_", "/"); // Decode from base64Url format
  const decoded = JSON.parse(atob(base64)); // Use atob to decode the base64 string
  return decoded;
};
