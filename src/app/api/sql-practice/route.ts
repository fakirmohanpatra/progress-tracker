import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { SqlChallenge } from '@/types';
import { getCompletedSqlChallenges, toggleSqlChallenge, getSqlStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const SQL_CHALLENGES: SqlChallenge[] = [
  {
    id: 'sql-second-highest-salary',
    title: 'Find 2nd Highest Salary',
    difficulty: 'Medium',
    category: 'Subqueries & Window Functions',
    description: 'Write a SQL query to find the second highest salary from the Employees table. If there is no second highest salary, return NULL.',
    expectedOutputHint: 'Result column: SecondHighestSalary',
    initialQuery: `-- Write a SQL query to get the second highest salary
SELECT (
    SELECT DISTINCT Salary 
    FROM Employees 
    ORDER BY Salary DESC 
    LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
    solutionQuery: `SELECT (
    SELECT DISTINCT Salary 
    FROM Employees 
    ORDER BY Salary DESC 
    LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
  },
  {
    id: 'sql-employees-earning-more-than-manager',
    title: 'Employees Earning More Than Manager',
    difficulty: 'Easy',
    category: 'Self Joins',
    description: 'Find the employees who earn more than their direct managers. Return employee names under column Employee.',
    expectedOutputHint: 'Result column: Employee',
    initialQuery: `-- Self join Employees with their Manager
SELECT e.Name AS Employee
FROM Employees e
JOIN Employees m ON e.ManagerId = m.Id
WHERE e.Salary > m.Salary;`,
    solutionQuery: `SELECT e.Name AS Employee
FROM Employees e
JOIN Employees m ON e.ManagerId = m.Id
WHERE e.Salary > m.Salary;`,
  },
  {
    id: 'sql-top-spending-customers',
    title: 'Top 3 Customers by Total Spend',
    difficulty: 'Medium',
    category: 'Aggregation & GROUP BY',
    description: 'Find the top 3 customers who have spent the most total money across completed orders.',
    expectedOutputHint: 'Result columns: CustomerName, TotalSpend',
    initialQuery: `SELECT 
    c.CustomerName, 
    SUM(o.TotalAmount) AS TotalSpend
FROM Customers c
JOIN Orders o ON c.Id = o.CustomerId
WHERE o.Status = 'Completed'
GROUP BY c.Id, c.CustomerName
ORDER BY TotalSpend DESC
LIMIT 3;`,
    solutionQuery: `SELECT 
    c.CustomerName, 
    SUM(o.TotalAmount) AS TotalSpend
FROM Customers c
JOIN Orders o ON c.Id = o.CustomerId
WHERE o.Status = 'Completed'
GROUP BY c.Id, c.CustomerName
ORDER BY TotalSpend DESC
LIMIT 3;`,
  },
  {
    id: 'sql-department-highest-salaries',
    title: 'Highest Salary in Each Department',
    difficulty: 'Medium',
    category: 'Window Functions (DENSE_RANK)',
    description: 'Find employees who have the highest salary in each of the departments.',
    expectedOutputHint: 'Result columns: DepartmentName, Employee, Salary',
    initialQuery: `WITH RankedSalaries AS (
    SELECT 
        d.DepartmentName,
        e.Name AS Employee,
        e.Salary,
        DENSE_RANK() OVER (PARTITION BY e.DepartmentId ORDER BY e.Salary DESC) AS Rank
    FROM Employees e
    JOIN Departments d ON e.DepartmentId = d.Id
)
SELECT DepartmentName, Employee, Salary
FROM RankedSalaries
WHERE Rank = 1;`,
    solutionQuery: `WITH RankedSalaries AS (
    SELECT 
        d.DepartmentName,
        e.Name AS Employee,
        e.Salary,
        DENSE_RANK() OVER (PARTITION BY e.DepartmentId ORDER BY e.Salary DESC) AS Rank
    FROM Employees e
    JOIN Departments d ON e.DepartmentId = d.Id
)
SELECT DepartmentName, Employee, Salary
FROM RankedSalaries
WHERE Rank = 1;`,
  },
  {
    id: 'sql-customers-who-never-order',
    title: 'Customers Who Never Placed an Order',
    difficulty: 'Easy',
    category: 'Outer Joins & NOT EXISTS',
    description: 'Find all customers who have never placed any order in the Orders table.',
    expectedOutputHint: 'Result column: Customers',
    initialQuery: `SELECT c.CustomerName AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.Id = o.CustomerId
WHERE o.Id IS NULL;`,
    solutionQuery: `SELECT c.CustomerName AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.Id = o.CustomerId
WHERE o.Id IS NULL;`,
  },
  {
    id: 'sql-running-revenue-total',
    title: 'Cumulative Revenue Running Total',
    difficulty: 'Hard',
    category: 'Window Functions (SUM OVER)',
    description: 'Compute the running cumulative total revenue by order date.',
    expectedOutputHint: 'Result columns: OrderDate, DailyRevenue, RunningTotal',
    initialQuery: `WITH DailyTotals AS (
    SELECT OrderDate, SUM(TotalAmount) AS DailyRevenue
    FROM Orders
    WHERE Status = 'Completed'
    GROUP BY OrderDate
)
SELECT 
    OrderDate,
    DailyRevenue,
    SUM(DailyRevenue) OVER (ORDER BY OrderDate ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal
FROM DailyTotals
ORDER BY OrderDate;`,
    solutionQuery: `WITH DailyTotals AS (
    SELECT OrderDate, SUM(TotalAmount) AS DailyRevenue
    FROM Orders
    WHERE Status = 'Completed'
    GROUP BY OrderDate
)
SELECT 
    OrderDate,
    DailyRevenue,
    SUM(DailyRevenue) OVER (ORDER BY OrderDate ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal
FROM DailyTotals
ORDER BY OrderDate;`,
  },
  {
    id: 'sql-duplicate-emails',
    title: 'Find Duplicate Emails',
    difficulty: 'Easy',
    category: 'HAVING Clauses',
    description: 'Write a SQL query to report all the duplicate emails in the Customers table.',
    expectedOutputHint: 'Result column: Email',
    initialQuery: `SELECT Email
FROM Customers
GROUP BY Email
HAVING COUNT(*) > 1;`,
    solutionQuery: `SELECT Email
FROM Customers
GROUP BY Email
HAVING COUNT(*) > 1;`,
  },
  {
    id: 'sql-department-avg-salary-filter',
    title: 'Departments with Avg Salary > 85,000',
    difficulty: 'Medium',
    category: 'GROUP BY & HAVING',
    description: 'Find departments having an average salary strictly greater than 85,000, along with employee counts.',
    expectedOutputHint: 'Result columns: DepartmentName, EmployeeCount, AvgSalary',
    initialQuery: `SELECT 
    d.DepartmentName,
    COUNT(e.Id) AS EmployeeCount,
    ROUND(AVG(e.Salary), 2) AS AvgSalary
FROM Departments d
JOIN Employees e ON d.Id = e.DepartmentId
GROUP BY d.Id, d.DepartmentName
HAVING AVG(e.Salary) > 85000
ORDER BY AvgSalary DESC;`,
    solutionQuery: `SELECT 
    d.DepartmentName,
    COUNT(e.Id) AS EmployeeCount,
    ROUND(AVG(e.Salary), 2) AS AvgSalary
FROM Departments d
JOIN Employees e ON d.Id = e.DepartmentId
GROUP BY d.Id, d.DepartmentName
HAVING AVG(e.Salary) > 85000
ORDER BY AvgSalary DESC;`,
  },
];

// Helper to create in-memory practice sandbox with realistic seed data
function createPracticeSandbox(): Database.Database {
  const sandbox = new Database(':memory:');
  sandbox.exec(`
    CREATE TABLE Departments (
      Id INTEGER PRIMARY KEY,
      DepartmentName TEXT NOT NULL,
      Location TEXT NOT NULL
    );

    CREATE TABLE Employees (
      Id INTEGER PRIMARY KEY,
      Name TEXT NOT NULL,
      DepartmentId INTEGER NOT NULL,
      ManagerId INTEGER,
      Salary INTEGER NOT NULL,
      HireDate TEXT NOT NULL,
      FOREIGN KEY(DepartmentId) REFERENCES Departments(Id)
    );

    CREATE TABLE Customers (
      Id INTEGER PRIMARY KEY,
      CustomerName TEXT NOT NULL,
      Email TEXT NOT NULL,
      Country TEXT NOT NULL
    );

    CREATE TABLE Orders (
      Id INTEGER PRIMARY KEY,
      CustomerId INTEGER NOT NULL,
      OrderDate TEXT NOT NULL,
      TotalAmount DECIMAL(10,2) NOT NULL,
      Status TEXT NOT NULL,
      FOREIGN KEY(CustomerId) REFERENCES Customers(Id)
    );

    CREATE TABLE Products (
      Id INTEGER PRIMARY KEY,
      ProductName TEXT NOT NULL,
      Category TEXT NOT NULL,
      UnitPrice DECIMAL(10,2) NOT NULL,
      StockQuantity INTEGER NOT NULL
    );

    -- Seed Departments
    INSERT INTO Departments VALUES (1, 'Engineering', 'Seattle');
    INSERT INTO Departments VALUES (2, 'Platform & DevOps', 'Austin');
    INSERT INTO Departments VALUES (3, 'Product Management', 'San Francisco');
    INSERT INTO Departments VALUES (4, 'Sales & Marketing', 'New York');

    -- Seed Employees (Includes managers and subordinate salary variations)
    INSERT INTO Employees VALUES (1, 'Sarah Chen', 1, NULL, 160000, '2021-03-15');
    INSERT INTO Employees VALUES (2, 'Alex Mercer', 1, 1, 135000, '2022-06-01');
    INSERT INTO Employees VALUES (3, 'David Kim', 1, 1, 175000, '2020-01-10'); -- Earns more than manager Sarah!
    INSERT INTO Employees VALUES (4, 'Elena Rostova', 2, NULL, 150000, '2021-08-20');
    INSERT INTO Employees VALUES (5, 'Marcus Vance', 2, 4, 120000, '2023-02-14');
    INSERT INTO Employees VALUES (6, 'Chloe Bennett', 3, NULL, 140000, '2022-11-05');
    INSERT INTO Employees VALUES (7, 'Liam Scott', 3, 6, 95000, '2024-01-15');
    INSERT INTO Employees VALUES (8, 'Priya Patel', 4, NULL, 110000, '2023-05-18');
    INSERT INTO Employees VALUES (9, 'Jordan Hayes', 4, 8, 80000, '2024-04-01');

    -- Seed Customers (includes duplicates for testing)
    INSERT INTO Customers VALUES (1, 'Alice Walker', 'alice@company.com', 'USA');
    INSERT INTO Customers VALUES (2, 'Bob Martinez', 'bob@acme.org', 'Canada');
    INSERT INTO Customers VALUES (3, 'Charlie Zhang', 'charlie@tech.io', 'USA');
    INSERT INTO Customers VALUES (4, 'Dana White', 'dana@company.com', 'UK');
    INSERT INTO Customers VALUES (5, 'Alice Duplicate', 'alice@company.com', 'USA'); -- Duplicate email!
    INSERT INTO Customers VALUES (6, 'Evan Stone', 'evan@neverordered.com', 'Germany'); -- Never ordered!

    -- Seed Orders
    INSERT INTO Orders VALUES (101, 1, '2026-09-01', 450.00, 'Completed');
    INSERT INTO Orders VALUES (102, 1, '2026-09-05', 820.00, 'Completed');
    INSERT INTO Orders VALUES (103, 2, '2026-09-02', 210.00, 'Completed');
    INSERT INTO Orders VALUES (104, 3, '2026-09-03', 1400.00, 'Completed');
    INSERT INTO Orders VALUES (105, 3, '2026-09-10', 950.00, 'Completed');
    INSERT INTO Orders VALUES (106, 4, '2026-09-08', 310.00, 'Cancelled');
    INSERT INTO Orders VALUES (107, 1, '2026-09-15', 620.00, 'Completed');
    INSERT INTO Orders VALUES (108, 2, '2026-09-18', 490.00, 'Completed');

    -- Seed Products
    INSERT INTO Products VALUES (1, 'Cloud Server S1', 'Compute', 120.00, 500);
    INSERT INTO Products VALUES (2, 'Managed Kafka Broker', 'Messaging', 350.00, 100);
    INSERT INTO Products VALUES (3, 'Redis Cache Cluster', 'Database', 180.00, 250);
    INSERT INTO Products VALUES (4, 'Enterprise Support Pack', 'Services', 800.00, 50);
    INSERT INTO Products VALUES (5, 'Legacy Gateway V1', 'Compute', 75.00, 0); -- Dead stock / zero orders
  `);
  return sandbox;
}

export async function GET() {
  const completedChallengeIds = await getCompletedSqlChallenges();
  const stats = await getSqlStats();

  return NextResponse.json({
    challenges: SQL_CHALLENGES,
    completedChallengeIds,
    stats,
    schema: {
      Departments: ['Id INTEGER', 'DepartmentName TEXT', 'Location TEXT'],
      Employees: ['Id INTEGER', 'Name TEXT', 'DepartmentId INTEGER', 'ManagerId INTEGER', 'Salary INTEGER', 'HireDate TEXT'],
      Customers: ['Id INTEGER', 'CustomerName TEXT', 'Email TEXT', 'Country TEXT'],
      Orders: ['Id INTEGER', 'CustomerId INTEGER', 'OrderDate TEXT', 'TotalAmount DECIMAL', 'Status TEXT'],
      Products: ['Id INTEGER', 'ProductName TEXT', 'Category TEXT', 'UnitPrice DECIMAL', 'StockQuantity INTEGER'],
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if toggling completion
    if (body.action === 'toggle_completed' || body.action === 'mark_solved') {
      const challengeId = body.challengeId;
      if (!challengeId) {
        return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
      }
      const result = await toggleSqlChallenge(challengeId, body.completed);
      const stats = await getSqlStats();
      return NextResponse.json({
        success: true,
        completed: result.completed,
        completedChallengeIds: result.completedIds,
        stats,
      });
    }

    const query = (body.query || body.sql)?.trim();

    if (!query) {
      return NextResponse.json({ error: 'SQL query cannot be empty' }, { status: 400 });
    }

    const sandbox = createPracticeSandbox();
    const start = performance.now();

    try {
      const stmt = sandbox.prepare(query);
      const rows = stmt.all();
      const executionTimeMs = Number((performance.now() - start).toFixed(2));
      const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];

      sandbox.close();
      return NextResponse.json({
        success: true,
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
      });
    } catch (sqlErr: unknown) {
      sandbox.close();
      const message = sqlErr instanceof Error ? sqlErr.message : String(sqlErr);
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Execution error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
