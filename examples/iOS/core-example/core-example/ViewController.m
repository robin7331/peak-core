//
//  ViewController.m
//  Vue-Plugin-1
//
//  Created by Robin Reiter on 28.04.16.
//  Copyright © 2016 Robin Reiter. All rights reserved.
//

#import "ViewController.h"
#import "iOSNative.h"

@interface ViewController () <WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate, iOSNativeDelegate>

@property WKWebView *webView;

@property iOSNative *native;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    WKUserContentController *contentController = [[WKUserContentController alloc] init];
    [contentController addScriptMessageHandler:self name:@"observe"];
    
    WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
    configuration.userContentController = contentController;
    
    self.webView = [[WKWebView alloc] initWithFrame:self.view.frame configuration:configuration];
    self.webView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    self.webView.scrollView.backgroundColor = [UIColor clearColor];
    
    self.webView.navigationDelegate = self;
    self.webView.UIDelegate = self;
    
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:3000/"]]];
    
    [self.view addSubview:self.webView];
    
    self.native  = [iOSNative new];
    self.native.delegate = self;
    
    
    NSLog(@"Test");
}

- (IBAction)reloadWebView:(id)sender {
    
    //    [self.webView evaluateJavaScript:@"Vue.NativeInterface.callJS('helloWorld');" completionHandler:nil];
    
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.0.14:3000/"]]];
}


- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    
    [self.native handleMessage:message];
    
}

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
    decisionHandler(WKNavigationActionPolicyAllow);
}

- (void)functionCalled:(NSString *)functionName withPayload:(id)payload andCallbackKey:(NSString *)callbackKey {
    NSString *completeFunctionName = [NSString stringWithFormat:@"%@:", functionName];
    [self performSelector:NSSelectorFromString(completeFunctionName) withObject:@{@"payload": payload, @"callbackKey": callbackKey}];
}

- (void)functionCalled:(NSString *)functionName withPayload:(id)payload {
    NSString *completeFunctionName = [NSString stringWithFormat:@"%@:", functionName];
    [self performSelector:NSSelectorFromString(completeFunctionName) withObject:payload];
}

- (void)onWindowLoad {
    NSLog(@"on window load");
}

- (void)onVueReady {
    NSLog(@"on Vue ready");
}


-(void)itemClicked:(NSDictionary *)item {
    NSLog(@"item name %@", [item objectForKey:@"name"]);
}

- (void)setNavigationBarTitle:(NSString *)title {
    self.title = title;
}


- (void)callbackTest:(NSDictionary *)data {
    
    NSDictionary *payload = data[@"payload"];
    NSString *callbackKey = data[@"callbackKey"];
    
    NSString *text = @"Hello fucking plugin";
    
    
    NSString *command = [NSString stringWithFormat:@"Vue.NativeInterface.callJS('%@', %@);", callbackKey, text];
    
    [self.webView evaluateJavaScript:command completionHandler:nil];
    
}

- (void)getPosition:(NSDictionary *)data {
    NSDictionary *payload = data[@"payload"];
    NSString *callbackKey = data[@"callbackKey"];
    
    double longitude = 12.9;
    double latitude = 3.09;
    
    NSDictionary *callbackData = @{
                                   @"longitude": @(longitude),
                                   @"latitude": @(latitude)
                                   };
    
    
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:callbackData
                                                       options:NSJSONWritingPrettyPrinted // Pass 0 if you don't care about the readability of the generated string
                                                         error:&error];
    
    if (! jsonData) {
        NSLog(@"Got an error: %@", error);
    } else {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        
        NSString *command = [NSString stringWithFormat:@"Vue.NativeInterface.callCallback('%@', '%@');", callbackKey, @"Hello Position"];
        
        NSLog(@"cmd: %@", command);
        
        [self.webView evaluateJavaScript:command completionHandler:^(id o, NSError *error) {
            
        }];
        
    }
    
    
    
    
}

- (IBAction)addItem:(id)sender {
    
    
    NSString *functionName = @"addItem";
    
    NSString *command = [NSString stringWithFormat:@"Vue.NativeInterface.callJS('%@');", functionName];
    
    [self.webView evaluateJavaScript:command completionHandler:^(id o, NSError *error) {
        NSLog(@"return val: %@", o);
    }];
}

- (IBAction)getUser:(id)sender {
    NSString *functionName = @"getUser";
    NSString *payload = @"Matze";
    
    NSString *command = [NSString stringWithFormat:@"Vue.NativeInterface.callJS('%@', '%@');", functionName, payload];
    
    [self.webView evaluateJavaScript:command completionHandler:^(id o, NSError *error) {
        NSLog(@"return val: %@", o);
    }];
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
