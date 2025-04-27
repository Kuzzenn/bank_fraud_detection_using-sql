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
