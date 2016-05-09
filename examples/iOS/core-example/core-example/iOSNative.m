//
// Created by Robin Reiter on 30.04.16.
// Copyright (c) 2016 Robin Reiter. All rights reserved.
//

#import "iOSNative.h"

#import <WebKit/WebKit.h>


@implementation iOSNative


- (void)handleMessage:(WKScriptMessage *)message {
    
    if (message == nil || message.name  == nil || message.body == nil) {
        return;
    }
    
    if ([message.name isEqualToString:@"observe"]) {
        
        NSDictionary *msg = (NSDictionary *) message.body;
        
        if (msg == nil) {
            return;
        }
        
        NSString *functionName = [msg objectForKey:@"functionName"];
        id payload = [msg objectForKey:@"payload"];
        NSString *callbackKey = [msg objectForKey:@"callbackKey"];
        
        if (self.delegate) {
            
            if ([functionName isEqualToString:@"log"]) {
                [self handleLog:payload];
                return;
            }
            
            if ([functionName isEqualToString:@"logError"]) {
                [self handleError:payload];
                return;
            }
            
            if ([functionName isEqualToString:@"onWindowLoad"]) {
                if (self.delegate && [self.delegate respondsToSelector:@selector(onWindowLoad)]) {
                    [self.delegate onWindowLoad];
                }
                return;
            }
            
            if ([functionName isEqualToString:@"onVueReady"]) {
                if (self.delegate && [self.delegate respondsToSelector:@selector(onVueReady)]) {
                    [self.delegate onVueReady];
                }
                return;
            }
            
            if (callbackKey == NULL) {
                [self.delegate functionCalled:functionName withPayload:payload];
            } else {
                [self.delegate functionCalled:functionName withPayload:payload andCallbackKey:callbackKey];
            }
        }
        
    }
}

- (void)handleLog:(id)message {
    NSLog(message);
}

- (void)handleError:(id)message {
    [self handleLog:message];
}
@end