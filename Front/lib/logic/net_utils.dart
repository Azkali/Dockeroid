import 'dart:convert';

import 'package:dockeroid/logic/server_config.dart';
import 'package:http/http.dart';

class DockeroidClientException extends ClientException {
	final String body;

	DockeroidClientException(String message, Uri targeturi, this.body): super(message, targeturi);
}

Future<T> httpGet<T>(ServerConfig server, String url, {T Function(dynamic) transform}) async {
	final targetUri = server.uri.resolve(url);
	final response = await get(targetUri);
	if(response.statusCode < 200 || response.statusCode >= 400){
		throw new DockeroidClientException('The server responded with a non-success code ${response.statusCode}', targetUri, response.body);
	}
	final entries = response.body.isEmpty ? null : json.decode(response.body);
	if(transform != null){
		return transform(entries);
	} else {
		return entries;
	}
}
