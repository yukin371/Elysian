ALTER TABLE roles
  ADD COLUMN data_scope SMALLINT NOT NULL DEFAULT 1;

ALTER TABLE roles
  ADD CONSTRAINT roles_data_scope_check
  CHECK (data_scope BETWEEN 1 AND 5);

CREATE TABLE role_depts (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  dept_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, dept_id)
);

CREATE INDEX role_depts_dept_id_idx ON role_depts (dept_id);

ALTER TABLE departments
  ADD COLUMN ancestors TEXT NOT NULL DEFAULT '';

WITH RECURSIVE department_paths AS (
  SELECT
    departments.id,
    departments.parent_id,
    ''::TEXT AS ancestors
  FROM departments
  WHERE departments.parent_id IS NULL

  UNION ALL

  SELECT
    child.id,
    child.parent_id,
    CASE
      WHEN parent.ancestors = '' THEN parent.id::TEXT
      ELSE parent.ancestors || ',' || parent.id::TEXT
    END AS ancestors
  FROM departments AS child
  INNER JOIN department_paths AS parent
    ON child.parent_id = parent.id
)
UPDATE departments
SET ancestors = department_paths.ancestors
FROM department_paths
WHERE departments.id = department_paths.id;

ALTER TABLE customers
  ADD COLUMN dept_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  ADD COLUMN creator_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX customers_dept_id_idx ON customers (dept_id);
CREATE INDEX customers_creator_id_idx ON customers (creator_id);

ALTER TABLE files
  ADD COLUMN dept_id UUID REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX files_dept_id_idx ON files (dept_id);

ALTER TABLE notifications
  ADD COLUMN dept_id UUID REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX notifications_dept_id_idx ON notifications (dept_id);
