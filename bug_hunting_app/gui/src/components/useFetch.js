import {useState, useEffect } from 'react'

const useFetch=(url) =>{
    const [data, setData]=useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        //const abortCont=new AbortController();
        setTimeout(()=>{
            fetch (url).then(res=>{  //fetch (url, {signal: abortCont.signal}).then.....
                if(!res.ok){
                    console.log('couldn"t fetch data');
                    throw Error ('couldn"t fetch data');
                }
                return res.json();
            }).then(data=>{
                setData(data);
                setIsPending(false)
                setError(null);
            }).catch(err=>{
                if(err.name==='AbortError'){
                    console.log('fetch aborted');
                }
                else{
                    setIsPending(false);
                    setError(err.message);
                }
            })
        }, 1000);
        //return ()=>abortCont.abort();
    }, [url]); //the function reruns when url modifies

    return {data, isPending, error} //object with these 3 properties
}

export default useFetch;