-- Create databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE cart_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;
CREATE DATABASE inventory_db;
CREATE DATABASE shipping_db;

-- Create extension for UUID generation
\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c user_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c cart_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c order_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c payment_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c inventory_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c shipping_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log success
SELECT 'Databases created successfully!' as message;
