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
    // NOTE: the inline `references: {..., onDelete}` shorthand does not
    // actually apply the onDelete action in this project's node-pg-migrate
    // setup (verified against pg_constraint.confdeltype), so all
    // onDelete-sensitive FKs below are added explicitly via addConstraint.

    // Rooms are shared camera resources, not owned by a single teacher —
    // provisioned outside this app (e.g. by whoever installs the camera).
    // camera_password is intentionally plain text: it doubles as the literal
    // HTTP Basic-Auth password sent to the camera when capturing a snapshot,
    // which rules out one-way hashing.
    pgm.createTable('rooms', {
        room_id: { type: 'varchar', notNull: true, primaryKey: true },
        camera_url: { type: 'varchar', notNull: true },
        camera_username: { type: 'varchar' },
        camera_password: { type: 'varchar', notNull: true },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })

    // A teacher "claims" a room by room_id + password and gives it their own
    // alias (room_name) — this is what a teacher actually sees/picks from.
    pgm.createTable('room_access', {
        teacher_id: { type: 'varchar', notNull: true },
        room_id: { type: 'varchar', notNull: true },
        room_name: { type: 'varchar', notNull: true }
    })
    pgm.addConstraint('room_access', 'room_access_pkey', {
        primaryKey: ['teacher_id', 'room_id']
    })
    pgm.addConstraint('room_access', 'room_access_teacher_id_fkey', {
        foreignKeys: {
            columns: 'teacher_id',
            references: 'teachers(mail)',
            onDelete: 'CASCADE'
        }
    })
    pgm.addConstraint('room_access', 'room_access_room_id_fkey', {
        foreignKeys: {
            columns: 'room_id',
            references: 'rooms(room_id)',
            onDelete: 'CASCADE'
        }
    })

    pgm.addColumn('classes', {
        room_id: { type: 'varchar', notNull: false }
    })
    pgm.addConstraint('classes', 'classes_room_id_fkey', {
        foreignKeys: {
            columns: 'room_id',
            references: 'rooms(room_id)',
            onDelete: 'SET NULL'
        }
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumn('classes', 'room_id')
    pgm.dropTable('room_access')
    pgm.dropTable('rooms')
};
