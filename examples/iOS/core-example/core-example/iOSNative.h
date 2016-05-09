//
// Created by Robin Reiter on 30.04.16.
// Copyright (c) 2016 Robin Reiter. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@protocol iOSNativeDelegate <NSObject>
@optional
- (void)functionCalled:(NSString *)functionName withPayload:(id)payload andCallbackKey:(NSString *)callbackKey;
- (void)functionCalled:(NSString *)functionName withPayload:(id)payload;

- (void)onWindowLoad;
- (void)onVueReady;
@end

@interface iOSNative : NSObject

@property id <iOSNativeDelegate> delegate;

- (void)handleMessage:(WKScriptMessage *)message;
//- (void)callCallback:(NSString *)key withData(:NSd)

@end

