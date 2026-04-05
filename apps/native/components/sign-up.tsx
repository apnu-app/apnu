import { useForm } from "@tanstack/react-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
  useToast,
} from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, View, Pressable, TouchableOpacity, Linking } from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Use at least 8 characters"),
  ageAgreed: z.boolean().refine((val) => val === true, {
    message: "You must be 18+ and a college student",
  }),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Privacy Policy",
  }),
});

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    for (const issue of error) {
      const message = getErrorMessage(issue);
      if (message) {
        return message;
      }
    }
    return null;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: unknown };
    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return null;
}

export function SignUp() {
  const router = useRouter();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      ageAgreed: false,
      termsAgreed: false,
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await authClient.signUp.email(
        {
          name: value.name.trim(),
          email: value.email.trim(),
          password: value.password,
        },
        {
          onError(error) {
            toast.show({
              variant: "danger",
              label: error.error?.message || "Failed to sign up",
            });
          },
          onSuccess() {
            formApi.reset();
            toast.show({
              variant: "success",
              label: "Account created successfully",
            });
            router.replace("/onboarding");
          },
        },
      );
    },
  });

  return (
    <Surface variant="secondary" className="p-4 rounded-lg">
      <Text className="text-foreground font-medium mb-4">Create Account</Text>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          validationError: getErrorMessage(state.errorMap.onSubmit),
        })}
      >
        {({ isSubmitting, validationError }) => {
          const formError = validationError;

          return (
              <View className="gap-3">
                <form.Field name="name">
                  {(field) => (
                    <View>
                      <TextField isInvalid={!!field.state.meta.errors.length}>
                        <Label>Name</Label>
                        <Input
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChangeText={field.handleChange}
                          placeholder="John Doe"
                          autoComplete="name"
                          textContentType="name"
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={() => {
                            emailInputRef.current?.focus();
                          }}
                        />
                      </TextField>
                      {field.state.meta.errors.length > 0 && (
                        <Text style={{ color: '#ff385c', fontSize: 12, marginTop: 4 }}>
                          {getErrorMessage(field.state.meta.errors)}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <View>
                      <TextField isInvalid={!!field.state.meta.errors.length}>
                        <Label>Email</Label>
                        <Input
                          ref={emailInputRef}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChangeText={field.handleChange}
                          placeholder="email@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          textContentType="emailAddress"
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={() => {
                            passwordInputRef.current?.focus();
                          }}
                        />
                      </TextField>
                      {field.state.meta.errors.length > 0 && (
                        <Text style={{ color: '#ff385c', fontSize: 12, marginTop: 4 }}>
                          {getErrorMessage(field.state.meta.errors)}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <View>
                      <TextField isInvalid={!!field.state.meta.errors.length}>
                        <Label>Password</Label>
                        <View className="relative">
                          <Input
                            ref={passwordInputRef}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChangeText={field.handleChange}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            autoComplete="new-password"
                            textContentType="newPassword"
                            returnKeyType="go"
                            onSubmitEditing={form.handleSubmit}
                            className="pr-12"
                          />
                          <Pressable 
                            onPress={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2"
                          >
                            <Ionicons 
                              name={showPassword ? "eye-off-outline" : "eye-outline"} 
                              size={22} 
                              color="#999" 
                            />
                          </Pressable>
                        </View>
                      </TextField>
                      {field.state.meta.errors.length > 0 && (
                        <Text style={{ color: '#ff385c', fontSize: 12, marginTop: 4 }}>
                          {getErrorMessage(field.state.meta.errors)}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>

                <form.Field name="ageAgreed">
                  {(field) => (
                    <View className="mb-1">
                      <TouchableOpacity 
                        onPress={() => field.handleChange(!field.state.value)} 
                        activeOpacity={0.7} 
                        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 }}
                      >
                        <View style={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: 5, 
                          borderWidth: 2, 
                          borderColor: field.state.value ? '#ff385c' : '#E5E7EB',
                          backgroundColor: field.state.value ? '#ff385c' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 2
                        }}>
                          {field.state.value && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        <Text style={{ flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 }}>
                          I am 18 or older and currently enrolled at a college in Ahmedabad or Gandhinagar.
                        </Text>
                      </TouchableOpacity>
                      {field.state.meta.errors.length > 0 && (
                        <Text style={{ color: '#ff385c', fontSize: 11, marginLeft: 30, marginTop: 4 }}>
                          {getErrorMessage(field.state.meta.errors)}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>

                <form.Field name="termsAgreed">
                  {(field) => (
                    <View className="mb-2">
                      <TouchableOpacity 
                        onPress={() => field.handleChange(!field.state.value)} 
                        activeOpacity={0.7} 
                        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 }}
                      >
                        <View style={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: 5, 
                          borderWidth: 2, 
                          borderColor: field.state.value ? '#ff385c' : '#E5E7EB',
                          backgroundColor: field.state.value ? '#ff385c' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 2
                        }}>
                          {field.state.value && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        <Text style={{ flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 }}>
                          I have read and agree to the <Text onPress={() => Linking.openURL('https://www.apnu.me/privacy')} style={{ color: '#ff385c', fontWeight: '700', textDecorationLine: 'underline' }}>Terms and Conditions</Text> and <Text onPress={() => Linking.openURL('https://www.apnu.me/privacy')} style={{ color: '#ff385c', fontWeight: '700', textDecorationLine: 'underline' }}>Privacy Policy</Text>.
                        </Text>
                      </TouchableOpacity>
                      {field.state.meta.errors.length > 0 && (
                        <Text style={{ color: '#ff385c', fontSize: 11, marginLeft: 30, marginTop: 4 }}>
                          {getErrorMessage(field.state.meta.errors)}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>

                <Button 
                   onPress={form.handleSubmit} 
                   isDisabled={isSubmitting} 
                   className="mt-1"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="default" />
                  ) : (
                    <Button.Label>Create Account</Button.Label>
                  )}
                </Button>
              </View>
          );
        }}
      </form.Subscribe>
    </Surface>
  );
}
