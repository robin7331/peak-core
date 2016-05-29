//
// Created by Robin Reiter on 16.05.16.
// Copyright (c) 2016 Robin Reiter. All rights reserved.
//

#import "MethodDefinition.h"


@implementation MethodDefinition {

}

+ (MethodDefinition *)definitionWithMessage:(WKScriptMessage *)message {
    return [[MethodDefinition alloc] initWithMessage:message];
}

- (instancetype)initWithMessage:(WKScriptMessage *)message {
    self = [super init];
    if (self) {

        _namespace = nil;
        _functionName = nil;
        _payloadType = MethodDefinitionPayloadTypeNone;
        _typeOfPayloadData = @{};

        if (message != nil) {
            NSDictionary *msg = (NSDictionary *) message.body;
            if (msg != nil) {
                NSDictionary *methodDefinition = msg[@"methodDefinition"];

                if (methodDefinition != nil) {
                    _namespace = methodDefinition[@"namespace"];
                    _functionName = methodDefinition[@"name"];
                    _payloadType = [self getPayloadTypeForMethodDefinitionPayloadType:methodDefinition[@"payloadType"]];
                    _typeOfPayloadData = [self getTypeOfPayloadDataTypeForPayloadData:methodDefinition[@"payloadData"]];
                }
            }
        }
    }

    return self;
}

- (MethodDefinitionPayloadType)getPayloadTypeForMethodDefinitionPayloadType:(NSString *)payloadType {

    if (payloadType) {

        if ([payloadType isEqualToString:@"string"])
            return MethodDefinitionPayloadTypeString;

        if ([payloadType isEqualToString:@"number"])
            return MethodDefinitionPayloadTypeNumber;

        if ([payloadType isEqualToString:@"object"])
            return MethodDefinitionPayloadTypeObject;

        if ([payloadType isEqualToString:@"boolean"])
            return MethodDefinitionPayloadTypeBoolean;

        if ([payloadType isEqualToString:@"none"])
            return MethodDefinitionPayloadTypeNone;

    }

    return MethodDefinitionPayloadTypeNone;
}

- (NSDictionary *)getTypeOfPayloadDataTypeForPayloadData:(NSDictionary *)dict {

    NSMutableDictionary *results = [@{} mutableCopy];

    if (dict) {
        for (NSString* key in dict.allKeys) {
            MethodDefinitionPayloadType type = [self getPayloadTypeForMethodDefinitionPayloadType:dict[key]];
            [results setObject:@(type) forKey:key];
        }
    }
    return results;
}

@end