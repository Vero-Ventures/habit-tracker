import { StyleSheet, Dimensions } from "react-native";
import Colors from "./Colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    backgroundColor: Colors.primary,
  },
  containerScrollview: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    width: Dimensions.get("window").width,
  },
  containerStyle: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  loginButtonTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
  loginButton: {
    height: 60,
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    width: Dimensions.get("window").width - 100,
    justifyContent: "flex-start",
  },
  disabledLoginButton: {
    justifyContent: "center",
  },
  loginButtonEmail: {
    backgroundColor: "rgba(0, 75, 125, 1)",
    borderColor: "rgba(0, 75, 125, 1)",
  },
  loginButtonGoogle: {
    backgroundColor: "#9F2436",
    borderColor: "#9F2436",
  },
  loginButtonApple: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  loginIconButtonContainer: {
    marginHorizontal: 24,
  },
  loginInput: {
    width: Dimensions.get("window").width - 44,
    color: "#9CC6FF",
    fontSize: 16,
  },
  loginInputContainer: {
    borderColor: "#455c8a",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: Dimensions.get("window").width - 44,
    padding: 0,
    marginLeft: 0,
  },
  containerInput: {
    paddingLeft: 0,
  },
  loginInputLabel: {
    color: "#FCFCFC",
    fontSize: 16,
    paddingLeft: 0,
    fontWeight: "300",
  },
  loginNextButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 44,
  },
  loginCreateAccountButton: {
    height: 64,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#9CC6FF",
    width: Dimensions.get("window").width - 44,
  },
  loginButtonBoldTitle: {
    color: "#FCFCFC",
    fontSize: 16,
    fontWeight: "600",
  },
  actionSheetButtonBox: {
    height: 50,
    marginTop: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292929",
  },
  actionSheetBody: {
    flex: 1,
    alignSelf: "flex-end",
    backgroundColor: "#4a4a4a",
  },
  actionSheetCancelButtonBox: {
    height: 50,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292929",
  },
  loginButtonApple: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  buttonIconStyle: {
    width: 24,
    height: 24,
    marginHorizontal: 20,
  },
  inputIconStyle: {
    width: 16,
    height: 16,
    opacity: 0.4,
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
});
