import 'package:eventify/eventify.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'server_config.dart';

class Preferences extends EventEmitter {
	static final serverConfigChanged = 'serverConfigChanged';

	static Preferences _instance;

	static final _sharedPrefs = SharedPreferences.getInstance();
	static final _currentConfigKey = 'currentConfig';

	ServerConfig _serverConfig;

	Preferences._internal();
	
	factory Preferences(){
		if(Preferences._instance == null){
			Preferences._instance = Preferences._internal();
			// Preferences._instance.on(Preferences.serverConfigChanged, Preferences._instance, (event, data){
			// 	print(event.toString());
			// 	print(event.eventData.toString());
			// 	print(data.toString());
			// });
		}
		return Preferences._instance;
	}

	Future<ServerConfig> getServerConfig() async {
		final prefs = await SharedPreferences.getInstance();
		final configId = prefs.getInt(Preferences._currentConfigKey);
		if(configId != null){
			print('Restoring server config $configId');
			final serverConfig = await ServerConfig.findConfig(configId);
			if(serverConfig != null){
				if(this._serverConfig != serverConfig){
					this.emit(Preferences.serverConfigChanged, this, serverConfig);
				}
				return serverConfig;
			} else {
				print('Server config $configId restoration failed, clear the preference');
				await prefs.remove(Preferences._currentConfigKey);
				throw new RangeError.value(configId);
			}
		}

		return null;
	}

	Future<void> setServerConfig(ServerConfig serverConfig) async {
		final prefs = await Preferences._sharedPrefs;
		prefs.setInt(Preferences._currentConfigKey, serverConfig.id);
		if(this._serverConfig != serverConfig){
			this.emit(Preferences.serverConfigChanged, this, serverConfig);
		}
	}
}
