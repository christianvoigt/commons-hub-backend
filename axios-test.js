const axios = require("axios");
const url = "http://localhost/wp-json/commons-booking-2/v1/items/";
const test = (async () => {
  try {
    const response = await axios.get(url, { maxContentLength: 200000 });
    console.log(response.data);
  } catch (e) {
    console.log(e);
  }
})();
