/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('teachers', {
        sr_no: { type: 'serial' },
        mail: { type: 'varchar', notNull: true, primaryKey: true },
        name: { type: 'varchar(50)', notNull: true },
        password: { type: 'varchar', notNull: true },
        college_name: { type: "varchar(100)", notNull: true }
    })
    pgm.createTable('classes', {
        class_id: { type: 'varchar', notNull: true, primaryKey: true },
        teacher_id: { type: 'varchar', notNull: true, references: { name: 'teachers', columns: 'mail', onDelete: 'CASCADE' } },
        section: { type: 'varchar', notNull: true },
        students: { type: 'integer', notNull: true },
        subject: { type: 'varchar', notNull: true }
    })
    pgm.createTable('students', {
        student_id: { type: 'varchar', notNull: true, primaryKey: true },
        roll_no: { type: 'varchar', notNull: true },
        class_id: { type: 'varchar', notNull: true, references: { name: 'classes', columns: 'class_id', onDelete: 'CASCADE' } },
        name: { type: 'varchar(50)', notNull: true },
    })
    pgm.createTable('attendance', {
        student_id: { type: 'varchar', notNull: true, primaryKey: true },
        class_id: { type: 'varchar', notNull: true, primaryKey: true, references: { name: 'classes', columns: 'class_id', onDelete: 'CASCADE' } },
        date: { type: 'date', notNull: true, primaryKey: true },
        status: { type: 'varchar', notNull: true }
    })
    pgm.createTable('embeddings', {
        student_id: { type: 'varchar', notNull: true, primaryKey: true, references: { name: 'students', columns: 'student_id', onDelete: 'CASCADE' } },
        class_id: { type: 'varchar', notNull: true, references: { name: 'classes', columns: 'class_id', onDelete: 'CASCADE' }, primaryKey: true },
        left_embeddings: { type: 'double PRECISION[]' },
        right_embeddings: { type: 'double PRECISION[]' },
        center_embeddings: { type: 'double PRECISION[]' }
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { };
