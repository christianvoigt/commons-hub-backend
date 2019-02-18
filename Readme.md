# Commons Hub Backend

The Commons Hub backend synchronizes and caches data from [Commons Api](https://github.com/wielebenwir/commons-api) data providers and gives access to this data through a JSON api. Data providers are responsible for registering with the Hub and notifying it of changed data. The Hub will then call the provided Commons Api endpoint to retrieve the new data.

Currently this is just a prototype for an alpha version. The Commons Hub software will first be used for velogistics.org as a platform for cargobike sharing. It will collect data from [Commons Booking 2](https://github.com/wielebenwir/commons-booking-2) instances of free cargobike initiatives.

The backend is implemented as a simple Express server with a MongoDb database. Agenda JS is used as a job system to debounce and manage data retrieval jobs.
