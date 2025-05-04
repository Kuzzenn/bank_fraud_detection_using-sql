drop table users cascade;
drop table accounts cascade;
drop table fraudlogs cascade;
drop table fraudrules cascade;
drop table transactions cascade;


-- USERS table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- ACCOUNTS table
CREATE TABLE Accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRANSACTIONS table
CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT REFERENCES Accounts(account_id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- e.g., 'deposit', 'withdrawal'
    amount NUMERIC(15, 2) NOT NULL,
    transaction_time TIMESTAMP DEFAULT NOW(),
    details TEXT
);


-- TRANSACTION LOGS (fraud incidents) table
CREATE TABLE TransactionLogs (
    log_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES Transactions(transaction_id) ON DELETE CASCADE,
    rule_id INT REFERENCES FraudRules(rule_id),
    detected_rule VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, resolved
    created_at TIMESTAMP DEFAULT NOW()
);



ALTER TABLE Accounts
ADD COLUMN account_status VARCHAR(50) DEFAULT 'active', -- active, blocked, restricted, limited
ADD COLUMN risk_level VARCHAR(50); -- low, medium, high

DROP TABLE IF EXISTS FraudRules cascade;


CREATE TABLE FraudRules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    action VARCHAR(50) NOT NULL, -- block, restrict, limit
    risk_level VARCHAR(50) NOT NULL, -- high, medium, low
    precedence INT NOT NULL, -- higher precedence -> more important
    active BOOLEAN DEFAULT TRUE
);


INSERT INTO FraudRules (rule_name, rule_description, action, risk_level, precedence)
VALUES
('Large Withdrawal', 'Withdrawal over $10,000 in a single transaction', 'block', 'high', 3),
('Multiple Failed Logins', '5 failed login attempts in 5 minutes', 'restrict', 'medium', 2),
('Unusual Location', 'Transaction from a new country not visited before', 'restrict', 'medium', 2),
('Rapid Transactions', 'More than 10 transactions in 5 minutes', 'limit', 'low', 1),
('Inactive Account Activity', 'Activity from account inactive for 6 months', 'block', 'high', 3);

-- USERS
INSERT INTO Users (username, email, role) VALUES
('alice', 'alice@example.com', 'customer'),
('bob', 'bob@example.com', 'customer'),
('admin', 'admin@bank.com', 'admin');

-- ACCOUNTS
INSERT INTO Accounts (user_id, account_number, balance) VALUES
(1, 'ACC1001', 5000.00),
(2, 'ACC1002', 3000.00);

-- TRANSACTIONS
INSERT INTO Transactions (account_id, transaction_type, amount, details) VALUES
(1, 'deposit', 1000.00, 'Initial deposit'),
(1, 'withdrawal', 200.00, 'ATM withdrawal'),
(2, 'deposit', 1500.00, 'Salary credited'),
(2, 'withdrawal', 500.00, 'Online shopping');


-- Large Withdrawal (should trigger 'block')
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
(1, 'withdrawal', 15000, 'Withdrawing large cash for business');

-- Normal Deposit (should not trigger anything)
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
(1, 'deposit', 500, 'Regular salary deposit');

-- Another Large Withdrawal (should trigger 'block')
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
(2, 'withdrawal', 12000, 'Urgent travel fund');

-- Small Deposit (should not trigger anything)
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
(2, 'deposit', 100, 'Small refund');

-- FRAUD RULES
truncate table FraudRules;

INSERT INTO FraudRules (rule_name, rule_description, action, risk_level, precedence)
VALUES
('Large Withdrawal', 'Withdrawal over $10,000', 'block', 'high', 3),
('Rapid Transactions', 'More than 10 transactions in short time', 'limit', 'low', 1),
('Unusual Location', 'New country detected', 'restrict', 'medium', 2),
('Inactive Account Activity', 'Activity after 6 months inactive', 'block', 'high', 3);


-- TRANSACTION LOGS
INSERT INTO TransactionLogs (transaction_id, rule_id, detected_rule, status) VALUES
(2, 2, 'Frequent Withdrawals', 'pending'),
(4, 1, 'Large Transaction', 'pending');



-----------------triggger


CREATE OR REPLACE FUNCTION detect_fraud_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    rule_row RECORD;
    matched_rule RECORD;
BEGIN
    -- Loop over active fraud rules
    FOR rule_row IN
        SELECT * FROM FraudRules WHERE active = TRUE
    LOOP
        -- Example: matching based on rule name (simple simulation)
        -- You can later add dynamic conditions in a more complex way

        -- Match Large Withdrawal
        IF rule_row.rule_name = 'Large Withdrawal' AND 
           NEW.transaction_type = 'withdrawal' AND 
           NEW.amount > 10000 THEN

            INSERT INTO TransactionLogs (transaction_id, rule_id, detected_rule)
            VALUES (NEW.transaction_id, rule_row.rule_id, rule_row.rule_name);

        ELSIF rule_row.rule_name = 'Rapid Transactions' THEN
            -- We skip complicated logic for now

        ELSIF rule_row.rule_name = 'Inactive Account Activity' THEN
            -- You can check if account has old created_at etc.

        -- Add more ELSIF here when needed
        END IF;

    END LOOP;

    -- Now find highest precedence rule (after inserting into TransactionLogs)
    SELECT fr.action, fr.risk_level
    INTO matched_rule
    FROM FraudRules fr
    JOIN TransactionLogs tl ON fr.rule_id = tl.rule_id
    WHERE tl.transaction_id = NEW.transaction_id
    ORDER BY fr.precedence DESC
    LIMIT 1;

    -- Apply account status if a rule was matched
    IF matched_rule IS NOT NULL THEN
        UPDATE Accounts
        SET account_status = matched_rule.action,
            risk_level = matched_rule.risk_level
        WHERE account_id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_detect_fraud
AFTER INSERT ON Transactions
FOR EACH ROW
EXECUTE FUNCTION detect_fraud_on_transaction();


-- ▶ Test 1: Large Withdrawal on account 1 (should fire the trigger)
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
  (1, 'withdrawal', 15000.00, 'Test: Large withdrawal >10k');

-- ▶ Test 2: Small Deposit on account 1 (should NOT fire)
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
  (1, 'deposit', 500.00, 'Test: Small deposit');

-- ▶ Test 3: Large Withdrawal on account 2 (should fire again)
INSERT INTO Transactions (account_id, transaction_type, amount, details)
VALUES
  (2, 'withdrawal', 20000.00, 'Test: Another large withdrawal');



-- Now inspect the logs and account statuses:

SELECT *
FROM TransactionLogs
ORDER BY log_id DESC
LIMIT 5;
/* 
  You should see two new rows (one for each large withdrawal) with:
    • detected_rule = 'Large Withdrawal'
    • status = 'pending'
*/

SELECT account_id, account_status, risk_level
FROM Accounts
WHERE account_id IN (1,2);
/*
  For account_id=1 and 2, you should now see:
    • account_status = 'block'
    • risk_level     = 'high'
  reflecting the action/risk of the matched rule.
*/

select * from accounts;

-- add to your Users table
ALTER TABLE Users
  
  ALTER COLUMN role SET NOT NULL;

ALTER TABLE Users
  ADD COLUMN password TEXT,



  -- 1) Truncate and reset the serial counter
TRUNCATE TABLE Users RESTART IDENTITY CASCADE;

-- 2) Insert sample users (all with password “secret”)
INSERT INTO Users (username, email, role, password) VALUES
  (
    'alice',
    'alice@example.com',
    'user',
    'alice'
  ),
  (
    'bob',
    'bob@example.com',
    'user',
    'bob'
  ),
  (
    'admin',
    'admin@bank.com',
    'admin',
    'admin'
  );

select * from users

-- 1) Wipe everything and reset IDs
TRUNCATE TABLE
  TransactionLogs,
  Transactions,
  Accounts,
  FraudRules,
  Users
RESTART IDENTITY CASCADE;

-- 2) Users (1 admin + 3 customers)
INSERT INTO Users (username, email, role, password) VALUES
  ('admin',   'admin@bank.com',   'admin', 'admin123'),
  ('alice',   'alice@bank.com',   'user',  'alicepw'),
  ('bob',     'bob@bank.com',     'user',  'bobpw'),
  ('charlie', 'charlie@bank.com', 'user',  'charliepw');

-- 3) Fraud rules
INSERT INTO FraudRules
  (rule_name, rule_description, action, risk_level, precedence, active)
VALUES
  ('Large Withdrawal', 'Withdrawal over $5,000 in one tx',       'block',    'high',   3, TRUE),
  ('Rapid Transactions','>5 tx in 1 hour',                      'limit',    'medium', 2, TRUE),
  ('Unusual Location',  'Tx from a new country',                'restrict', 'medium', 2, TRUE),
  ('Inactive Account',  'Activity on 180+ days dormant account','block',    'high',   3, TRUE),
  ('Small Amount Pattern','>3 small (<$50) withdrawals in 10m','restrict', 'low',    1, TRUE);

-- 4) Accounts
--   user_id: 2=alice, 3=bob, 4=charlie
INSERT INTO Accounts
  (user_id, account_number, balance, account_status, risk_level)
VALUES
  (2, 'ACC2001', 12000.00, 'active',  'low'),
  (2, 'ACC2002',   300.00, 'active',  'low'),
  (3, 'ACC3001',   800.00, 'active',  'low'),
  (4, 'ACC4001',     0.00, 'active',  NULL);

-- 5) Transactions
--   (account 1 = ACC2001; account 2 = ACC2002; account 3 = ACC3001; 4 = ACC4001)

-- Account 1: Alice’s primary
INSERT INTO Transactions
  (account_id, transaction_type, amount, transaction_time, details)
VALUES
  (1, 'deposit',    15000.00, NOW() - INTERVAL '30 days', 'Salary credit'),
  (1, 'withdrawal',  6000.00, NOW() - INTERVAL '29 days', 'Large rent payment'),
  (1, 'withdrawal',    20.00, NOW() - INTERVAL '1 hour',   'Coffee shop'),
  (1, 'withdrawal',    25.00, NOW() - INTERVAL '55 minutes','Snack purchase'),
  (1, 'withdrawal',    30.00, NOW() - INTERVAL '50 minutes','Parking fee'),
  (1, 'withdrawal',    15.00, NOW() - INTERVAL '45 minutes','Bus fare'),
  (1, 'withdrawal',    18.00, NOW() - INTERVAL '40 minutes','Fast food'),
  (1, 'deposit',      100.00, NOW() - INTERVAL '200 days',  'Legacy adjustment');

-- Account 2: Alice’s secondary
INSERT INTO Transactions
  (account_id, transaction_type, amount, transaction_time, details)
VALUES
  (2, 'deposit',  500.00, NOW() - INTERVAL '5 days', 'Gift'),
  (2, 'withdrawal',50.00, NOW() - INTERVAL '4 days','Groceries');

-- Account 3: Bob’s
INSERT INTO Transactions
  (account_id, transaction_type, amount, transaction_time, details)
VALUES
  (3, 'deposit',   800.00, NOW() - INTERVAL '2 days', 'Initial deposit'),
  (3, 'withdrawal',700.00, NOW() - INTERVAL '1 day',  'Appliance purchase');

-- Note: Account 4 (Charlie) left with zero balance & no tx

-- 6) Manual fraud logs (for demo; your trigger may add others automatically)
--    tx 2 → Large Withdrawal
--    tx 4 → Small Amount Pattern
--    tx 8 → Inactive Account
INSERT INTO TransactionLogs
  (transaction_id, rule_id, detected_rule, status, created_at)
VALUES
  (2, 1, 'Large Withdrawal', 'pending', NOW() - INTERVAL '29 days'),
  (4, 5, 'Small Amount Pattern', 'pending', NOW() - INTERVAL '40 minutes'),
  (8, 4, 'Inactive Account', 'pending', NOW() - INTERVAL '200 days');

ALTER TABLE users RENAME TO "user";
ALTER TABLE "user" RENAME TO users;


select * from users;

