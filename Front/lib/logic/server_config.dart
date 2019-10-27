import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class ServerConfig {
	int _id = 0;
	String label;

	Uri uri;
	// TODO: String username;
	// TODO: String password;

	ServerConfig(this.label, this.uri);

	factory ServerConfig._fromMap(Map<String, dynamic> map){
		final serverConfig = ServerConfig(
			map['label'],
			new Uri(scheme: map['scheme'], host: map['host'], port: map['port'], path: map['path'])
		);
		serverConfig._id = map['id'];
		return serverConfig;
	}

	static final _serversDatabasePath = getDatabasesPath().then((path) => join(path, 'servers.db'));
	static final _database = ServerConfig._serversDatabasePath.then((dbpath) => openDatabase(
			// Set the path to the database. Note: Using the `join` function from the
			// `path` package is best practice to ensure the path is correctly
			// constructed for each platform.
			dbpath,
			onCreate: (db, version) {
				return ServerConfig.createDatabase(db);
			},
			// Set the version. This executes the onCreate function and provides a
			// path to perform database upgrades and downgrades.
			version: 1,
		)
	);

	static Future<void> dropDatabase([Database db]) async {
		db = db ?? await ServerConfig._database;
		await db.execute('DROP TABLE IF EXISTS servers');
	}
	static Future<void> createDatabase([Database db]) async {
		db = db ?? await ServerConfig._database;
		// Run the CREATE TABLE statement on the database.
		return db.execute(
			"CREATE TABLE servers(id INTEGER PRIMARY KEY, label TEXT, scheme TEXT, host TEXT, port INTEGER, path TEXT)",
		);
	}

	static Future<List<ServerConfig>> getServerConfigs() async {
		final db = await ServerConfig._database;

		// Query the table for all the ServerConfig.
		final List<Map<String, dynamic>> maps = await db.query('servers');

		// Convert the List<Map<String, dynamic> into a List<ServerConfig>.
		return List.generate(maps.length, (i) => ServerConfig._fromMap(maps[i]));
	}

	String resolve([String path]) {
		return (path != null ? this.uri.resolve(path) : this.uri).toString();
	}

	Map<String, dynamic> toMap(){
		return {
			'id': this._id,
			'label': this.label,
			'scheme': this.uri.scheme,
			'host': this.uri.host,
			'port': this.uri.port,
			'path': this.uri.path
		};
	}

	Future<void> save() async {
		final db = await ServerConfig._database;

		if(this._id != 0){
			await db.update(
				'servers',
				this.toMap(),
				where: "id = ?",
				whereArgs: [this._id],
			);
		} else {
			this._id = await db.insert(
				'servers',
				this.toMap(),
				conflictAlgorithm: ConflictAlgorithm.replace
			);
		}
	}

	Future<void> remove() async {
		if(this._id == 0){
			throw RangeError.value(0, 'id');
		}
		final db = await ServerConfig._database;

		await db.delete(
			"servers",
			where: "id = ?",
			whereArgs: [this._id],
		);
	}

	bool operator==(other){
		if(other is ServerConfig){
			return other._id == this._id;
		}
		return false;
	}
}
