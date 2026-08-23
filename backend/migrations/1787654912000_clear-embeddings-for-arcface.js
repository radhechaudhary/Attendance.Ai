/**
 * Migration: Clear old 128-d dlib embeddings for ArcFace 512-d upgrade
 * 
 * ArcFace (InsightFace) produces 512-dimensional embeddings, which are
 * mathematically incompatible with the old 128-d dlib embeddings.
 * 
 * The column type (DOUBLE PRECISION[]) is flexible and supports any array
 * length, so no schema change is needed — only the data must be cleared.
 * 
 * All students will need to re-register after this migration.
 * 
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // Truncate embeddings and cascade to remove associated student records,
    // since students must re-register with the new ArcFace model.
    pgm.sql('TRUNCATE TABLE embeddings CASCADE');
    pgm.sql('TRUNCATE TABLE students CASCADE');

    // Add a comment to document the new expected embedding dimension
    pgm.sql("COMMENT ON COLUMN embeddings.left_embeddings IS 'ArcFace 512-d embedding (float64[])'");
    pgm.sql("COMMENT ON COLUMN embeddings.right_embeddings IS 'ArcFace 512-d embedding (float64[])'");
    pgm.sql("COMMENT ON COLUMN embeddings.center_embeddings IS 'ArcFace 512-d embedding (float64[])'");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    // Remove the comments (data cannot be restored)
    pgm.sql("COMMENT ON COLUMN embeddings.left_embeddings IS NULL");
    pgm.sql("COMMENT ON COLUMN embeddings.right_embeddings IS NULL");
    pgm.sql("COMMENT ON COLUMN embeddings.center_embeddings IS NULL");
};
