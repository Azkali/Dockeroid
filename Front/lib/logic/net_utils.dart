import 'dart:convert';

import 'package:dockeroid/logic/server_config.dart';
import 'package:http/http.dart';

class DockeroidClientException extends ClientException {
	final String body;

	DockeroidClientException(String message, Uri targeturi, this.body): super(message, targeturi);
}

Future<T> httpGetServer<T>(ServerConfig server, String url, {T Function(dynamic) transform}) async {
	final targetUri = server.uri.resolve(url);
	return httpGet<T>(targetUri, transform: transform);
}

Future<T> httpGet<T>(Uri url, {T Function(dynamic) transform}) async {
	final response = await get(url);
	if(response.statusCode < 200 || response.statusCode >= 400){
		throw new DockeroidClientException('The server responded with a non-success code ${response.statusCode}', url, response.body);
	}
	final parsedResponse = response.body.isEmpty ? null : json.decode(response.body);
	if(transform != null){
		return transform(parsedResponse);
	} else {
		return parsedResponse;
	}
}
