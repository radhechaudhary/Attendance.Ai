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
    pgm.createTable('student_accounts', {
        email: { type: 'varchar', notNull: true, primaryKey: true },
        name: { type: 'varchar(50)', notNull: true },
        password: { type: 'varchar', notNull: true },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })

    // students.student_id alone is currently the PK, which limits a student
    // to exactly one class in the whole system. Move to a composite PK of
    // (student_id, class_id) so one student can enroll in many classes.
    pgm.dropConstraint('embeddings', 'embeddings_student_id_fkey')
    pgm.dropConstraint('students', 'students_pkey')
    pgm.addConstraint('students', 'students_pkey', {
        primaryKey: ['student_id', 'class_id']
    })
    pgm.addConstraint('students', 'students_student_id_student_accounts_fkey', {
        foreignKeys: {
            columns: 'student_id',
            references: 'student_accounts(email)',
            onDelete: 'CASCADE'
        }
    })
    pgm.addConstraint('embeddings', 'embeddings_student_id_class_id_fkey', {
        foreignKeys: {
            columns: ['student_id', 'class_id'],
            references: 'students(student_id, class_id)',
            onDelete: 'CASCADE'
        }
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropConstraint('embeddings', 'embeddings_student_id_class_id_fkey')
    pgm.dropConstraint('students', 'students_student_id_student_accounts_fkey')
    pgm.dropConstraint('students', 'students_pkey')
    pgm.addConstraint('students', 'students_pkey', { primaryKey: 'student_id' })
    pgm.addConstraint('embeddings', 'embeddings_student_id_fkey', {
        foreignKeys: {
            columns: 'student_id',
            references: 'students(student_id)',
            onDelete: 'CASCADE'
        }
    })
    pgm.dropTable('student_accounts')
};
