//
// Created by Robin Reiter on 09.05.16.
// Copyright (c) 2016 Robin Reiter. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface PeakCore : NSObject


@property WKWebView *webView;
@property (nonatomic, readonly) WKWebViewConfiguration *webViewConfiguration;

- (void)callJSMethod:(NSString *)functionName inNamespace:(NSString *)namespace;

- (instancetype)initWithTarget:(id)target;

@end