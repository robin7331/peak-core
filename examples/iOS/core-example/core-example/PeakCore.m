//
// Created by Robin Reiter on 09.05.16.
// Copyright (c) 2016 Robin Reiter. All rights reserved.
//

#import "PeakCore.h"

@interface PeakCore () <WKScriptMessageHandler>
@property id target;
@end

@implementation PeakCore {

}

- (void)callJSMethod:(NSString *)functionName inNamespace:(NSString *)namespace {

//    NSString *serializedPayload = [self serializePayload:callbackPayload];
    NSString *callbackCall = [NSString stringWithFormat:@"window.peak.callJS('%@', '%@', 'test 123');", namespace, functionName];

    [self.webView evaluateJavaScript:callbackCall completionHandler:^(id o, NSError *error) {
        NSLog(@"Callback data: %@", o);
    }];
}

- (instancetype)initWithTarget:(id)target {
    self = [super init];
    if (self) {
        _target = target;

        WKUserContentController *contentController = [[WKUserContentController alloc] init];
        [contentController addScriptMessageHandler:self name:@"PeakCore"];

        WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
        configuration.userContentController = contentController;

        _webViewConfiguration = configuration;
    }

    return self;
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {

    [self handleMessage:message];

}


- (void)handleMessage:(WKScriptMessage *)message {

    if (message == nil || message.name == nil || message.body == nil) {
        return;
    }

    if ([message.name isEqualToString:@"PeakCore"]) {

        NSDictionary *msg = (NSDictionary *) message.body;

        if (msg == nil) {
            return;
        }

        NSDictionary *methodDefinition = msg[@"methodDefinition"];


        NSString *namespace = methodDefinition[@"namespace"];
        NSString *functionName = methodDefinition[@"name"];
        id payload = [msg objectForKey:@"payload"];
        NSString *callbackKey = [msg objectForKey:@"callbackKey"];

        if ([functionName isEqualToString:@"log"]) {
            [self handleLog:payload];
            return;
        }

        if ([functionName isEqualToString:@"logError"]) {
            [self handleError:payload];
            return;
        }


        if (callbackKey == NULL) {
            NSString *selectorString = [NSString stringWithFormat:@"%@:", functionName];
            [self.target performSelector:NSSelectorFromString(selectorString) withObject:payload];
        } else {

            NSString *selectorString = [NSString stringWithFormat:@"%@:withCallback:", functionName];

            __weak PeakCore *weakself = self;
            __weak NSString *weakCallbackKey = callbackKey;

            [self.target  performSelector:NSSelectorFromString(selectorString)
                       withObject:payload
                       withObject:^(NSString *callbackPayload) {

                            NSString *serializedPayload = [weakself serializePayload:callbackPayload];
                           NSString *callbackCall = [NSString stringWithFormat:@"window.peak.callCallback('%@', '%@');", weakCallbackKey, serializedPayload];

                           [weakself.webView evaluateJavaScript:callbackCall completionHandler:^(id o, NSError *error) {

                           }];
                       }];
        }

    }
}

-(NSString *)serializePayload:(id)payload {

    if ([[payload class] isKindOfClass:[NSArray class]] || [[payload class] isKindOfClass:[NSDictionary class]]) {
        NSError *error;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:payload
                                                           options:0
                                                             error:&error];
        if (! jsonData) {
            return @"";
        } else {

            NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
            return jsonString;
        }
    } else {
        return payload;
    }

    return nil;
}

- (void)handleLog:(id)message {
    NSLog(message);
}

- (void)handleError:(id)message {
    NSLog(message);
//    [[NSException exceptionWithName:message reason:@"" userInfo:nil] raise];
}


@end