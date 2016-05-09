//
//  ViewController.m
//  Vue-Plugin-1
//
//  Created by Robin Reiter on 28.04.16.
//  Copyright © 2016 Robin Reiter. All rights reserved.
//

#import "ViewController.h"
#import "PeakCore.h"

@interface ViewController ()

@property WKWebView *webView;
@property PeakCore *peakCore;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.peakCore  = [[PeakCore alloc] initWithTarget:self];

    self.webView = [[WKWebView alloc] initWithFrame:self.view.frame configuration:self.peakCore.webViewConfiguration];
    self.webView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    self.webView.scrollView.backgroundColor = [UIColor clearColor];

    self.peakCore.webView = self.webView;
    
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:3000/"]]];
    
    [self.view addSubview:self.webView];
    


}

- (IBAction)reloadWebView:(id)sender {
    
    //    [self.webView evaluateJavaScript:@"Vue.NativeInterface.callJS('helloWorld');" completionHandler:nil];
    
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.0.14:3000/"]]];
}

-(void)logTest:(NSString *)msg {
    NSLog(msg);
}


// TODO: improve callback block (make it easier)
- (void)callbackTest:(NSNumber *)number withCallback:(void (^) (NSString *callbackPayload))callback {

    callback(@"it works");

}

// TODO: implement callJS functionality to PeakCore

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
