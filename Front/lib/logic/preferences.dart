import 'package:shared_preferences/shared_preferences.dart';

import 'server_config.dart';

abstract class Preferences {
	static final String _currentConfigKey = 'currentConfig';

	static int _getServerConfigId(SharedPreferences prefs){
		return prefs.getInt(Preferences._currentConfigKey);
	}

	static Future<ServerConfig> getServerConfig() async {
		final prefs = await SharedPreferences.getInstance();
		final configId = Preferences._getServerConfigId(prefs);
		if(configId != null){
			print('Restoring server config $configId');
			final config = await ServerConfig.findConfig(configId);
			if(config != null){
				return config;
			} else {
				print('Server config $configId restoration failed, clear the preference');
				await prefs.remove(Preferences._currentConfigKey);
				throw new RangeError.value(configId);
			}
		}

		return null;
	}

	static Future<int> getServerConfigId() async {
		return Preferences._getServerConfigId(await SharedPreferences.getInstance());
	}

	static Future<void> setServerConfig(ServerConfig serverConfig) async {
		final prefs = await SharedPreferences.getInstance();
		prefs.setInt(Preferences._currentConfigKey, serverConfig.id);
	}
}
