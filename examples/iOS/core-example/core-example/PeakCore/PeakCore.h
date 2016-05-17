//
// Created by Robin Reiter on 09.05.16.
// Copyright (c) 2016 Robin Reiter. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

typedef void (^PeakCoreCallback)(id callbackPayload);

@interface PeakCore : NSObject

@property WKWebView *webView;
@property (nonatomic, readonly) WKWebViewConfiguration *webViewConfiguration;

- (instancetype)initWithTarget:(id)target;

- (void)callJSFunctionName:(NSString *)functionName inNamespace:(NSString *)namespace;
- (void)callJSFunctionName:(NSString *)functionName inNamespace:(NSString *)namespace withPayload:(id)payload;
- (void)callJSFunctionName:(NSString *)functionName inNamespace:(NSString *)namespace withCallback:(id)callback;
- (void)callJSFunctionName:(NSString *)functionName inNamespace:(NSString *)namespace withPayload:(id)payload andCallback:(PeakCoreCallback)callback;
@end