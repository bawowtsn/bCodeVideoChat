import React from 'react'


//by using the children prop, we can render whatever is passed into the options component (Notifications passed in options from App.js) in the div right here
const Options = ( { children } ) => {
    return (
        <div>
            Options
            {children}
        </div>
    )
}

export default Options
