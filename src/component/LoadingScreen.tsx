import { ActivityIndicator, SafeAreaView, StatusBar, View } from "react-native"
import GlobalStyles from "../globals/styles"

const LoadingScreen = ()=>{
    return (
       <SafeAreaView style={{flex:1,backgroundColor:'#red',position:'absolute',zIndex:3,top:'55%',left:'45%'}}>
        <View style={{height:'100%',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',}}>
        <ActivityIndicator size={'large'} color={GlobalStyles.colors.PrimaryColor} />
        </View>
       </SafeAreaView>
    )
}
export default LoadingScreen