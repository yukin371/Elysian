CREATE OR REPLACE FUNCTION get_descendant_dept_ids(root_dept_ids UUID[])
RETURNS UUID[]
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE target_departments AS (
    SELECT DISTINCT unnest(root_dept_ids) AS id
  ),
  dept_tree AS (
    SELECT departments.id
    FROM departments
    INNER JOIN target_departments
      ON departments.id = target_departments.id

    UNION

    SELECT child.id
    FROM departments AS child
    INNER JOIN dept_tree
      ON child.parent_id = dept_tree.id
  )
  SELECT COALESCE(
    array_agg(DISTINCT dept_tree.id ORDER BY dept_tree.id),
    ARRAY[]::UUID[]
  )
  FROM dept_tree;
$$;
