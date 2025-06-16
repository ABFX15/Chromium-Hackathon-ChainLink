

Args: [address, city, state, zip]
Secrets: { apiKey: "RENT_CAST_API" }

const address = args[0];
const city = args[1];
const state = args[2];
const zip = args[3];
const apiKey = secrets.apiKey;

const url = `https://api.rentcast.io/v1/property/value?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zip=${encodeURIComponent(zip)}`;

const request = await Functions.makeHttpRequest({
    url,
    headers: { "X-Api-Key": apiKey }
});

// Check for a valid response
if (!request.data || typeof request.data.value !== "number") {
    throw Error("No value returned from RentCast API");
}

// Return the value as a uint256
return Functions.encodeUint256(request.data.value);